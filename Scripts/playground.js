var dict = {
    '`Transform3D`': [
      '`Position`',       '`Basis`',
      '`y`',              '`zy`',
      '`xx`',             '`z`',
      '`xz`',             '`yx`',
      '`yy`',             '`xy`',
      '`yz`',             '`zz`',
      '`x`',              '`zx`',
      '1682462164.497',   '-2',
      '0',                '1',
      '1.68325996398926'
    ],
    '`Basis`': [
      '`zy`', '`xx`',
      '`xz`', '`yx`',
      '`yy`', '`xy`',
      '`yz`', '`zz`',
      '`zx`', '1682462164.497',
      '0',    '1'
    ],
    '`Position`': [
      '`y`',
      '`z`',
      '`x`',
      '1682462164.497']
  }

  console.log(dict[Object.keys(dict)[0]].includes('`Transform3D`'))