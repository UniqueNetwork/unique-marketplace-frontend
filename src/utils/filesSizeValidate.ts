export const filesSizeValidate = (
  fileArray: FileList | File[],
  withoutTotalMax?: boolean
): File[] | undefined => {
  const MAX_FILE_SIZE_MB = 3;
  const MAX_TOTAL_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

  const files = Array.from(fileArray || []);
  const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE_BYTES);

  if (validFiles.length < files.length) {
    alert(
      `Some files exceed the maximum size of ${MAX_FILE_SIZE_MB} MB and will not be uploaded.`
    );
  }

  if (!withoutTotalMax) {
    const totalSize = validFiles.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
      alert(`Total file size exceeds ${MAX_TOTAL_SIZE_MB} MB and will not be uploaded.`);
      return undefined;
    }
  }

  return validFiles;
};