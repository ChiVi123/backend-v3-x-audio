import { Injectable } from '@nestjs/common';
import slugifyRoot from 'slugify';
import type { SlugifyService } from '~/application/services/slugify.service';

@Injectable()
export class SlugifyServiceImpl implements SlugifyService {
  slugify(text: string): string {
    return slugifyRoot(text, { lower: true, strict: true, trim: true });
  }
}
