export function useProtectedAsset(fileName) {
  return fileName ? `/assets/${fileName}` : ''
}
