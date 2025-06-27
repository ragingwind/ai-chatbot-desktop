import { getImageProviderById } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream, selectedProvider }) => {
    let draftContent = '';

    const provider = getImageProviderById(selectedProvider || 'xai');
    const { image } = await experimental_generateImage({
      model: provider.imageModel('small-model'),
      prompt: title,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.writeData({
      type: 'image-delta',
      content: image.base64,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ description, dataStream, selectedProvider }) => {
    let draftContent = '';

    const provider = getImageProviderById(selectedProvider || 'xai');
    const { image } = await experimental_generateImage({
      model: provider.imageModel('small-model'),
      prompt: description,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.writeData({
      type: 'image-delta',
      content: image.base64,
    });

    return draftContent;
  },
});
