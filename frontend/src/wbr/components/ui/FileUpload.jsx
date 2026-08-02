/**
 * File dropzone for KYC uploads — mobile-first, 44px+ tap target.
 */
export default function FileUpload({
  label,
  hint = "PNG, JPG, or PDF · max 8MB",
  accept = "image/*,.pdf",
  fileName,
  onFile,
  error,
}) {
  function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      onFile?.(null, "File must be 8MB or smaller");
      return;
    }
    onFile?.(file, null);
  }

  return (
    <div className={`field${error ? " error" : ""}`}>
      {label ? <span className="field-label">{label}</span> : null}
      <label className={`file-upload${fileName ? " has-file" : ""}`}>
        <input type="file" accept={accept} onChange={handleChange} />
        <span className="file-upload-title">{fileName || "Tap to upload"}</span>
        <span className="file-upload-hint">{fileName ? "Tap to replace" : hint}</span>
      </label>
      {error ? <span className="field-hint">{error}</span> : null}
    </div>
  );
}
