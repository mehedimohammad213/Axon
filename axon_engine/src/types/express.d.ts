declare global {
  namespace Express {
    interface Request {
      user?: any;
      organization?: any;
      siteKey?: string;
    }
  }
}
export {};
