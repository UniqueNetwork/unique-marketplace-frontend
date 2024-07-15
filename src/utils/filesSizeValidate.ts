export const filesSizeValidate = (
  fileArray: FileList | File[]
): File[] | undefined => {
  const MAX_FILE_SIZE_MB = 1;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const files = Array.from(fileArray || []);
  const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE_BYTES);

  if (validFiles.length < files.length) {
    alert(
      `Some files exceed the maximum size of ${MAX_FILE_SIZE_MB} MB and will not be uploaded.`
    );
    return undefined;
  }

  return validFiles;
};
