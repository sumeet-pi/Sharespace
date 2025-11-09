import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { BookOpen, Trash2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const JournalPage = ({ user, onLogout }) => {
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', entry_type: 'daily', mood: '😊' });
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const moodEmojis = ['😊', '😢', '😰', '😔', '😤', '🤗', '💪', '🌟'];

  // Get localStorage key for current user
  const getStorageKey = () => {
    if (!user?.id) return null;
    return `sharespace_journals_${user.id}`;
  };

  // Load journals from localStorage on mount
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const journals = JSON.parse(stored);
        // Sort by createdAt (newest first)
        const sorted = journals.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at);
          const dateB = new Date(b.createdAt || b.created_at);
          return dateB - dateA;
        });
        setEntries(sorted);
      }
    } catch (error) {
      console.error('Error loading journals from localStorage:', error);
    }
  }, [user?.id]);

  // Save journals to localStorage
  const saveToLocalStorage = (journals) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(journals));
    } catch (error) {
      console.error('Error saving journals to localStorage:', error);
      toast.error('Failed to save journal');
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const journal = {
        id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newEntry.title.trim(),
        content: newEntry.content.trim(),
        mood: newEntry.mood,
        createdAt: new Date().toISOString(),
        // Keep entry_type for backward compatibility with existing UI
        entry_type: newEntry.entry_type,
        created_at: new Date().toISOString(),
      };

      const updatedEntries = [journal, ...entries];
      // Sort by createdAt (newest first)
      const sorted = updatedEntries.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at);
        const dateB = new Date(b.createdAt || b.created_at);
        return dateB - dateA;
      });

      setEntries(sorted);
      saveToLocalStorage(sorted);
      toast.success('Journal saved successfully ✅');
      setNewEntry({ title: '', content: '', entry_type: 'daily', mood: '😊' });
      setShowCreate(false);
      setLoading(false);
    }, 500);
  };

  const handleDeleteClick = (entryId) => {
    setEntryToDelete(entryId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!entryToDelete) return;
    
    const updatedEntries = entries.filter(e => e.id !== entryToDelete);
    setEntries(updatedEntries);
    saveToLocalStorage(updatedEntries);
    toast.error('Journal deleted ❌');
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const filteredEntries = activeTab === 'all'
    ? entries
    : entries.filter(e => e.entry_type === activeTab);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Sidebar user={user} onLogout={onLogout} />
      
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Journal</h1>
              <p className="text-gray-600">Your personal space for reflection and growth</p>
            </div>
            <Button
              data-testid="new-journal-btn"
              onClick={() => setShowCreate(!showCreate)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-6 shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              New Entry
            </Button>
          </div>

          {showCreate && (
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-none shadow-xl mb-8">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Entry Type</Label>
                    <Select value={newEntry.entry_type} onValueChange={(v) => setNewEntry({ ...newEntry, entry_type: v })}>
                      <SelectTrigger data-testid="entry-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Entry</SelectItem>
                        <SelectItem value="reflection">Reflection</SelectItem>
                        <SelectItem value="gratitude">Gratitude</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Mood</Label>
                    <div className="flex gap-2 mt-2">
                      {moodEmojis.slice(0, 4).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewEntry({ ...newEntry, mood: emoji })}
                          className={`text-2xl p-2 rounded-lg ${
                            newEntry.mood === emoji ? 'bg-blue-100 scale-110' : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    data-testid="entry-title"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="Give your entry a title..."
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    data-testid="entry-content"
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    placeholder="Write your thoughts..."
                    rows={6}
                    className="resize-none"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                  <Button data-testid="save-entry-btn" type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Entry'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-white/70 backdrop-blur-sm">
              <TabsTrigger value="all" data-testid="tab-all">All Entries</TabsTrigger>
              <TabsTrigger value="daily" data-testid="tab-daily">Daily</TabsTrigger>
              <TabsTrigger value="reflection" data-testid="tab-reflection">Reflections</TabsTrigger>
              <TabsTrigger value="gratitude" data-testid="tab-gratitude">Gratitude</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <Card className="p-12 text-center bg-white/70 backdrop-blur-sm border-none shadow-lg">
                <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500 text-lg">No journals yet. Start your first entry!</p>
              </Card>
            ) : (
              filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  data-testid={`entry-${entry.id}`}
                  className="p-6 bg-white/70 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      {entry.mood && <span className="text-2xl">{entry.mood}</span>}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{entry.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(entry.createdAt || entry.created_at).toLocaleDateString()} • {entry.entry_type}
                        </p>
                      </div>
                    </div>
                    <Button
                      data-testid={`delete-entry-${entry.id}`}
                      onClick={() => handleDeleteClick(entry.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Delete Journal Entry</DialogTitle>
            <DialogDescription className="text-gray-600 pt-2">
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleDeleteCancel}
              className="sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalPage;
