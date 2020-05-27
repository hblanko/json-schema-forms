const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'http://landarltracker.com/schemas/great/invention.json',
  title: 'Testing',
  type: 'object',
  required: ['qqt'],
  minProperties: 5,
  maxProperties: 6,
  properties: {
    qqt: {
      const: 3,
      /*{
              myNiceConst: 'u u u'
            }*/
    },
    ost: {
      title: 'un titulito',
      description: 'es una basura de titulito',
      enum: [345345, [4, 2]],
    },
    sst: {
      title: 'An enum',
      enum: [
        {
          this: '3',
        },
        '3',
        3,
        true,
        null,
        [
          [
            {
              qq: 'sdf',
              aa: -4,
              bb: 'b',
            },
            3,
          ],
          4,
          5,
        ],
        4,
        // 'A very very long stringegergiuhbengviuergeriugeuieiuegfeiu',
        {
          ways: false,
          other: true,
        },
      ],
    },
    fString: {
      title: 'F String',
      description: 'An object created for recreation.',
      type: 'object',
      oneOf: [
        {
          title: 'A',
          oneOf: [
            {
              title: 'A.1',
              oneOf: [
                {
                  title: 'Que sea booleano',
                  properties: {
                    aString: {
                      title: 'From A.1.1',
                      type: 'boolean',
                    },
                  },
                },
                {
                  title: 'A.1.2',
                  properties: {
                    aString: {
                      title: 'From A.1.2',
                      type: 'array',
                      minItems: 1,
                      maxItems: 3,
                      items: {
                        title: 'do you like it?',
                        anyOf: [
                          {
                            title: 'array',
                            type: 'string',
                          },
                          {
                            title: 'obj',
                            type: 'array',
                            items: {
                              type: 'string',
                            },
                          },
                        ],
                      },
                      additionalItems: {
                        title: 'najlepszego',
                        description: 'beauty personified',
                        type: 'boolean',
                      },
                    },
                  },
                },
              ],
              anyOf: [
                {
                  title: 'A.2.1',
                  properties: {
                    bString: {
                      title: 'From A.2.1',
                      type: 'number',
                      minimum: 0,
                      multipleOf: 4,
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          title: 'B',
          anyOf: [
            {
              title: 'B.1',
              oneOf: [
                {
                  title: 'B.1.1',
                  properties: {
                    aString: {
                      title: 'From B.1.1',
                      type: 'string',
                    },
                  },
                },
                {
                  title: 'B.1.2',
                  properties: {
                    aString: {
                      title: 'From B.1.2',
                      oneOf: [
                        {
                          type: 'boolean',
                        },
                        {
                          type: 'integer',
                        },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  additionalProperties: {
    title: "nice, isn't it?",
    oneOf: [
      {
        title: '🤷‍',
        type: 'string',
      },
      {
        title: '🔘',
        type: 'number',
        multipleOf: 7,
        exclusiveMinimum: 3,
      },
    ],
  },
};

export default schema;
