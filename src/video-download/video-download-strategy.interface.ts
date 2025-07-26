export interface VideoDownloadStrategy {
  download(url: string): Promise<{ status: string; platform: string; downloadUrl?: string; error?: string; title?: string }>;

}
