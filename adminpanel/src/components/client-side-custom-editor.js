// components/client-side-custom-editor.js
'use client' // Required for App Router

import dynamic from 'next/dynamic';

const CustomEditor = dynamic(() => import('@/components/tiptap'), { ssr: false });

export default CustomEditor;