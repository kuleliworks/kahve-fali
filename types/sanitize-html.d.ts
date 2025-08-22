declare module "sanitize-html" {
  export interface IOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedSchemes?: string[];
    transformTags?: Record<string, (tagName: string, attribs: any) => { tagName: string; attribs: any }>;
  }
  export default function sanitizeHtml(dirty: string, options?: IOptions): string;
}
