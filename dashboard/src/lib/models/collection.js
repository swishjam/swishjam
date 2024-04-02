export class Collection {
  constructor(modelKlass, modelAttributes) {
    this._models = modelAttributes.map(attributes => new modelKlass(attributes));
  }

  models = () => this._models;
}

export default Collection;