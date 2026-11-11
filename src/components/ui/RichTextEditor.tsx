"use client";

import { useEffect, useRef, useState, useId } from "react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  label?: string;
  minHeight?: string;
  required?: boolean;
  className?: string;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Tulis deskripsi, materi, atau soal di sini...",
  name,
  id,
  label,
  minHeight = "140px",
  required = false,
  className = "",
}: RichTextEditorProps) {
  const autoId = useId();
  const editorId = id || `quill-editor-${autoId.replace(/:/g, "")}`;
  const editorContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quillRef = useRef<any>(null);
  const [internalValue, setInternalValue] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onChangeRef = useRef(onChange);
  const placeholderRef = useRef(placeholder);
  const initialValueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
    placeholderRef.current = placeholder;
  });

  // Sync editor if external value is changed programmatically
  const prevValuePropRef = useRef(value);
  useEffect(() => {
    if (prevValuePropRef.current !== value) {
      prevValuePropRef.current = value;
      if (quillRef.current) {
        const currentHtml = quillRef.current.root.innerHTML;
        if (value !== currentHtml && (value || currentHtml !== "<p><br></p>")) {
          quillRef.current.root.innerHTML = value || "";
        }
      }
    }
  }, [value]);

  useEffect(() => {
    let isMounted = true;

    async function initQuill() {
      if (typeof window === "undefined" || !editorContainerRef.current) return;
      if (quillRef.current) return;

      try {
        const { default: Quill } = await import("quill");
        if (!isMounted || !editorContainerRef.current) return;

        // Standard configuration matching Terrawise
        const toolbarOptions = [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ];

        const quill = new Quill(editorContainerRef.current, {
          theme: "snow",
          placeholder: placeholderRef.current,
          modules: {
            toolbar: toolbarOptions,
          },
        });

        // Set initial HTML value
        if (initialValueRef.current) {
          quill.root.innerHTML = initialValueRef.current;
        }

        // Custom Image Handler
        const toolbar = quill.getModule("toolbar") as {
          addHandler: (format: string, handler: () => void) => void;
        } | null;

        if (toolbar) {
          toolbar.addHandler("image", () => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          });
        }

        // Listen for changes
        quill.on("text-change", () => {
          let html = quill.root.innerHTML;
          if (html === "<p><br></p>") {
            html = "";
          }
          setInternalValue(html);
          if (onChangeRef.current) {
            onChangeRef.current(html);
          }
        });

        quillRef.current = quill;
      } catch (err) {
        console.error("Failed to initialize Quill editor:", err);
      }
    }

    initQuill();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quillRef.current) return;

    setIsUploading(true);
    const quill = quillRef.current;
    const range = quill.getSelection(true) || { index: quill.getLength() };

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.url) {
        quill.insertEmbed(range.index, "image", data.url);
        quill.setSelection(range.index + 1);
      } else {
        // Fallback: Read as base64 Data URL
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const base64Url = loadEvent.target?.result as string;
          if (base64Url) {
            quill.insertEmbed(range.index, "image", base64Url);
            quill.setSelection(range.index + 1);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn("Upload endpoint failed, falling back to base64 DataURL:", err);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64Url = loadEvent.target?.result as string;
        if (base64Url) {
          quill.insertEmbed(range.index, "image", base64Url);
          quill.setSelection(range.index + 1);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const effectiveValue = value !== undefined ? value : internalValue;

  return (
    <div className={`rich-editor-wrapper relative ${className}`}>
      {label && (
        <label
          htmlFor={editorId}
          className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-gray-500"
        >
          {label} {required && <span className="text-black">*</span>}
        </label>
      )}

      {/* Hidden file input for custom image handler */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Uploading Indicator Banner */}
      {isUploading && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 rounded-lg bg-black px-2.5 py-1 text-[11px] font-bold text-white shadow-md animate-pulse">
          <span>Mengunggah gambar...</span>
        </div>
      )}

      {/* Quill Container */}
      <div
        id={editorId}
        ref={editorContainerRef}
        style={{ minHeight }}
        className="bg-white"
      />

      {/* Hidden textarea for form submission */}
      {name && (
        <textarea
          name={name}
          value={effectiveValue}
          required={required && (!effectiveValue || effectiveValue === "<p><br></p>")}
          readOnly
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
