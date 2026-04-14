import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const ParseFormData = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const body = request.body;
  const files = request.files as Express.Multer.File[];

  console.log('[ParseFormData] files detected:', files?.length);

  if (!body || typeof body !== 'object') return body;

  const parsedBody = { ...body };

  for (const key of Object.keys(parsedBody)) {
    const value = parsedBody[key];
    if (typeof value === 'string') {
      // Parse JSON nested objects (specs, frGraphData, images metadata)
      if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
        try {
          parsedBody[key] = JSON.parse(value);
        } catch {
          /* ignore */
        }
      }
      // Parse Number for Branded Types (price, impedance, sensitivity...)
      else if (value !== '' && !Number.isNaN(Number(value)) && key !== 'slug') {
        parsedBody[key] = Number(value);
      }
      // Parse Boolean
      else if (value === 'true') parsedBody[key] = true;
      else if (value === 'false') parsedBody[key] = false;
    }
  }

  // IMPORTANT LOGIC: Mix physical files into the images metadata array
  // This helps DTO compatible with CreateProductUseCase (dto.images[0].file)
  if (files && Array.isArray(parsedBody.images)) {
    // biome-ignore lint/suspicious/noExplicitAny: parsedBody is a dynamic FormData object with unknown shape
    parsedBody.images = parsedBody.images.map((img: any, index: number) => ({
      ...img,
      file: files[index]?.buffer,
    }));
  }

  return parsedBody;
});
