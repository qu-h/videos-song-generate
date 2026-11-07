'use client';

import React, { useId, useRef, useState } from 'react';
import { textToJsonString, textToJsonObject } from '../core/json-string';

export interface TextToJsonConverterProps {
  initialText?: string;
  initialPropertyName?: string;
  className?: string;
}

const EXAMPLE = `[Verse 1]
Em nói: "Ngày mai trời sẽ nắng"
Đường dẫn bản thu: C:\\Music\\bai-hat.mp3

[Chorus]
Giữ nguyên từng dòng lời ca… 🎵`;

export function TextToJsonConverter({initialText = '', initialPropertyName = 'lyrics', className = ''}: TextToJsonConverterProps) {
  const id = useId();
  const [text, setText] = useState(initialText);
  const [propertyName, setPropertyName] = useState(initialPropertyName);
  const [message, setMessage] = useState('');
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const objectRef = useRef<HTMLTextAreaElement>(null);
  const jsonString = textToJsonString(text);
  const jsonObject = textToJsonObject(text, propertyName || 'lyrics');

  const copy = async (value: string, kind: 'string' | 'object') => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      setMessage(kind === 'string' ? 'Đã sao chép chuỗi JSON.' : 'Đã sao chép object JSON.');
    } catch {
      const output = kind === 'string' ? outputRef.current : objectRef.current;
      output?.focus(); output?.select();
      setMessage('Đã chọn kết quả. Nhấn Ctrl+C (hoặc ⌘C) để sao chép.');
    }
  };

  return (
    <section className={`vsg-json-tool ${className}`} aria-labelledby={`${id}-title`}>
      <header className="vsg-json-heading">
        <div>
          <h2 id={`${id}-title`}>Văn bản → Chuỗi JSON</h2>
          <p>Dán lời bài hát hoặc văn bản nhiều dòng. Kết quả tự cập nhật, giữ nguyên nội dung và các ký tự đặc biệt.</p>
        </div>
        <div className="vsg-json-actions">
          <button type="button" className="vsg-btn-secondary" onClick={() => {setText(EXAMPLE); setMessage('');}}>Dùng ví dụ</button>
          <button type="button" className="vsg-btn-secondary" onClick={() => {setText(''); setMessage('');}}>Xóa văn bản</button>
        </div>
      </header>
      <div className="vsg-json-grid">
        <div className="vsg-json-panel">
          <label htmlFor={`${id}-source`}>Văn bản gốc</label>
          <textarea id={`${id}-source`} className="vsg-json-textarea" data-json-source value={text} rows={14}
            spellCheck={false} placeholder={'Dán văn bản nhiều dòng tại đây…'}
            onChange={event => {setText(event.target.value); setMessage('');}} />
        </div>
        <div className="vsg-json-panel">
          <div className="vsg-json-label-row">
            <label htmlFor={`${id}-string`}>Chuỗi JSON hợp lệ</label>
            <button type="button" className="vsg-btn-copy" onClick={() => copy(jsonString,'string')}>Sao chép chuỗi JSON</button>
          </div>
          <textarea id={`${id}-string`} className="vsg-json-textarea" data-json-string ref={outputRef} value={jsonString} readOnly rows={14} spellCheck={false} />
          <p className="vsg-json-help">Dán toàn bộ kết quả vào giá trị của trường JSON, gồm cả dấu nháy kép ở đầu và cuối. Không thêm một cặp dấu nháy nữa.</p>
        </div>
      </div>
      <div className="vsg-json-panel vsg-json-object">
        <div className="vsg-json-label-row">
          <label htmlFor={`${id}-key`}>Tên trường JSON</label>
          <button type="button" className="vsg-btn-copy" onClick={() => copy(jsonObject,'object')}>Sao chép object JSON</button>
        </div>
        <input id={`${id}-key`} className="vsg-search-input" data-json-key value={propertyName} placeholder="lyrics" spellCheck={false}
          onChange={event => {setPropertyName(event.target.value); setMessage('');}} />
        <label className="vsg-json-object-label" htmlFor={`${id}-object`}>Object JSON hoàn chỉnh</label>
        <textarea id={`${id}-object`} className="vsg-json-textarea" data-json-object ref={objectRef} value={jsonObject} readOnly rows={5} spellCheck={false} />
      </div>
      <p className="vsg-json-status" role="status" aria-live="polite">{message}</p>
      <p className="vsg-json-help">Chuyển đổi ngay trên trình duyệt. Công cụ không tự ghi vào file dữ liệu.</p>
    </section>
  );
}
