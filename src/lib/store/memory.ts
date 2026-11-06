import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import type { PaymentAttempt, PaymentLink, Store } from "./types";

interface Data {
  links: Record<string, PaymentLink>;
  attempts: Record<string, PaymentAttempt>;
}

/**
 * Store for local development and tests, used when Supabase is not configured.
 * If `filePath` is given, data is saved as JSON so it survives dev-server reloads.
 * Not for production: serverless instances do not share a filesystem.
 */
export class LocalStore implements Store {
  private data: Data = { links: {}, attempts: {} };

  constructor(private readonly filePath?: string) {
    if (filePath && existsSync(filePath)) this.data = JSON.parse(readFileSync(filePath, "utf8"));
  }

  private save() {
    if (!this.filePath) return;
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  private normalizeLink(link: PaymentLink): PaymentLink {
    return {
      ...link,
      lineItems: Array.isArray(link.lineItems) ? link.lineItems : [],
      nearRecordTx: link.nearRecordTx ?? null,
    };
  }

  async createLink(link: PaymentLink) {
    this.data.links[link.id] = this.normalizeLink(link);
    this.save();
  }
  async getLink(id: string) {
    const l = this.data.links[id];
    return l ? this.normalizeLink(l) : null;
  }
  async listLinksByOwner(hash: string) {
    return Object.values(this.data.links)
      .filter((l) => l.ownerTokenHash === hash)
      .map((l) => this.normalizeLink(l))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async markLinkPaid(id: string, paidAt: string) {
    const link = this.data.links[id];
    if (link && !link.paidAt) {
      link.paidAt = paidAt;
      this.save();
    }
  }
  async setLinkNearRecordTx(id: string, nearRecordTx: string) {
    const link = this.data.links[id];
    if (link && !link.nearRecordTx) {
      link.nearRecordTx = nearRecordTx;
      this.save();
    }
  }
  async createAttempt(a: PaymentAttempt) {
    this.data.attempts[a.id] = a;
    this.save();
  }
  async getAttempt(id: string) {
    return this.data.attempts[id] ?? null;
  }
  async listAttemptsByLink(linkId: string) {
    return Object.values(this.data.attempts)
      .filter((a) => a.linkId === linkId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async updateAttempt(id: string, patch: Partial<PaymentAttempt>) {
    const a = this.data.attempts[id];
    if (a) {
      Object.assign(a, patch);
      this.save();
    }
  }
}
