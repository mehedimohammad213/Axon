/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module "*.css";
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

declare module "react-lazyload";
declare module "react-text-to-speech";
declare module "react-virtualized";
declare module "react-froala-wysiwyg";
declare module "froala-editor";
declare module "croppie";
declare module "event-source-polyfill";
declare module "lottie-react";
declare module "react-google-charts";
declare module "ace-builds";
declare module "quill";
declare module "react-syntax-highlighter";
declare module "react-syntax-highlighter/dist/cjs/styles/prism";
declare module "react-syntax-highlighter/dist/cjs/styles/hljs";

export {};
