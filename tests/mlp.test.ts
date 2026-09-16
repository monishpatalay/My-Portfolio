import {readFile} from 'node:fs/promises';
import {describe,expect,it} from 'vitest';
import {decodeWeights,predict,type Manifest} from '../components/playground/mlp';

describe('quantized MNIST inference', () => {
  it('matches all 50 Python reference predictions', async () => {
    const manifest: Manifest = JSON.parse(await readFile('public/models/manifest.json','utf8'));
    const raw = await readFile('public/models/mlp-weights.bin');
    const layers = decodeWeights(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength) as ArrayBuffer,manifest);
    const fixtures = JSON.parse(await readFile('tests/fixtures/mnist.json','utf8')) as {pixels:number[];label:number;probabilities:number[]}[];
    for (const fixture of fixtures.slice(0,50)) {
      const result = predict(Float32Array.from(fixture.pixels,value=>value/255),layers);
      expect(result.probabilities.indexOf(Math.max(...result.probabilities))).toBe(fixture.probabilities.indexOf(Math.max(...fixture.probabilities)));
      result.probabilities.forEach((value,index)=>expect(value).toBeCloseTo(fixture.probabilities[index],4));
    }
  });
});
