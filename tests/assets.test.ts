import {readdir} from 'node:fs/promises';
import {describe,expect,it} from 'vitest';

describe('public assets', () => {
  it('contains none of the template author project images', async () => {
    const banned = ['drishti.png','votechain.png','floodhub.png','gamekroy.png','hektools.png','phoenix.png','redxchess.png','eie.png'];
    const files = await readdir('public',{recursive:true});
    expect(files.filter(file=>banned.includes(String(file).split('/').at(-1)??''))).toEqual([]);
  });
});
