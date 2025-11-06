import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Avatar helpers for resolving and listing local avatars from src/pfp
// Note: We export helpers that work at runtime in CRA/Webpack using require.context
let avatarContext;
try {
  // Resolve images in ../pfp relative to this file
  // Example keys: './cat.png'
  // This will compile to URLs we can use as <img src>
  // eslint-disable-next-line global-require
  avatarContext = require.context('../pfp', false, /\.(png|jpe?g|gif|webp)$/);
} catch (_) {
  avatarContext = { keys: () => [], resolve: () => null };
}

export function getAvailableAvatars() {
  try {
    return avatarContext.keys().map((key) => {
      const fileName = key.replace('./', '');
      const relativePath = `/pfp/${fileName}`; // value to save in DB
      const url = avatarContext(key); // compiled asset URL to render
      return { key, fileName, path: relativePath, url };
    });
  } catch {
    return [];
  }
}

export function resolveAvatarUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  // If it's a stored relative path like '/pfp/cat.png', map to built asset URL
  if (typeof pathOrUrl === 'string' && pathOrUrl.startsWith('/pfp/')) {
    const key = `./${pathOrUrl.replace('/pfp/', '')}`;
    try {
      return avatarContext(key);
    } catch {
      return null;
    }
  }
  // For non-local paths, do not return external URLs (enforce local-only avatars)
  return null;
}