import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { X, Download, FileText, ZoomIn, ZoomOut, RotateCw, ExternalLink, BookOpen } from 'lucide-react';

export const DocumentViewerModal: React.FC = () => {
  const { documentViewer, closeDocumentViewer } = useDatabase();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!documentViewer.isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <div className="p-1.5 rounded-lg bg-white/10 text-amber-300 shrink-0">
              {documentViewer.type === 'pdf' ? (
                <BookOpen className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>
            <div className="truncate">
              <h3 className="text-sm font-semibold truncate text-stone-100">
                {documentViewer.title || 'Document Preview'}
              </h3>
              {documentViewer.subtitle && (
                <p className="text-[11px] text-stone-400 truncate">{documentViewer.subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {documentViewer.type === 'image' && (
              <>
                <button
                  onClick={handleZoomOut}
                  title="Zoom out"
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomIn}
                  title="Zoom in"
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotate}
                  title="Rotate"
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </>
            )}

            {documentViewer.url && (
              <a
                href={documentViewer.url}
                target="_blank"
                rel="noreferrer"
                download
                title="Download or open original"
                className="p-1.5 text-amber-300 hover:text-amber-200 rounded-lg hover:bg-white/10 transition"
              >
                <Download className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={closeDocumentViewer}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-4 bg-stone-100 flex items-center justify-center min-h-[320px]">
          {documentViewer.type === 'image' && documentViewer.url ? (
            <div className="overflow-auto max-h-[70vh] flex items-center justify-center">
              <img
                src={documentViewer.url}
                alt={documentViewer.title}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-in-out',
                }}
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-md border border-stone-200"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : documentViewer.type === 'pdf' || documentViewer.textContent ? (
            <div className="w-full max-h-[65vh] overflow-y-auto bg-white p-6 rounded-xl shadow-xs border border-stone-200 text-stone-800 space-y-4 font-serif leading-relaxed">
              <div className="border-b border-stone-200 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-sans uppercase font-bold text-[#7A1224] tracking-wider">
                    Digital Document Viewer
                  </span>
                  <h4 className="text-base font-bold font-cinzel text-stone-900 mt-0.5">
                    {documentViewer.title}
                  </h4>
                </div>
                {documentViewer.url && (
                  <a
                    href={documentViewer.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-sans font-semibold text-[#0E4D34] flex items-center gap-1 hover:underline"
                  >
                    <span>Open in new window</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {documentViewer.textContent ? (
                <div className="whitespace-pre-wrap text-sm text-stone-700 bg-amber-50/40 p-4 rounded-lg border border-amber-200/50 font-sans">
                  {documentViewer.textContent}
                </div>
              ) : (
                <div className="text-center py-12 text-stone-500 font-sans space-y-2">
                  <BookOpen className="w-12 h-12 text-[#C59B27] mx-auto opacity-75" />
                  <p className="font-semibold text-stone-700">Digital Document Attached</p>
                  <p className="text-xs text-stone-500">
                    File: {documentViewer.subtitle || 'Publication.pdf'}
                  </p>
                  {documentViewer.url && (
                    <a
                      href={documentViewer.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 bg-[#7A1224] text-white text-xs font-semibold rounded-xl hover:bg-[#580B18] transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Digital PDF</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-stone-500 py-12">
              <p>No preview available for this document.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-4 py-2.5 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Official Document Archive • An Noor Organization</span>
          <button
            onClick={closeDocumentViewer}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
