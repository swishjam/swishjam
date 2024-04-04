export class OrganizationProfile {
  constructor(attributes) {
    this._attributes = attributes;
    this._id = attributes.id || attributes.swishjam_organization_id;
    this._name = attributes.name;
    this._uniqueIdentifier = attributes.organization_unique_identifier;
    this._metadata = attributes.metadata || {};
    this._createdAt = attributes.created_at;
    if (typeof this._metadata === 'string') {
      this._metadata = JSON.parse(this._metadata);
    }
  }

  id = () => this._id;
  name = () => this._name;
  uniqueIdentifier = () => this._uniqueIdentifier;
  metadata = () => this._metadata;
  properties = () => this._metadata;
  createdAt = () => this._createdAt;
  attributes = () => this._attributes;
  displayName = () => this.fullName() || this.email() || this.uniqueIdentifier()
  metadataItem = key => this.metadata()[key];
  property = this.metadataItem;

  initials = () => {
    if (this.name()) {
      return this.name().split(' ').map(word => word[0]).join('');
    }
  }

  enrichmentData = () => {
    if (this.attributes().enrichment_data) {
      return this.attributes().enrichment_data;
    } else {
      let enrichmentData = {};
      Object.keys(this.metadata()).forEach(key => {
        if (key.startsWith('enrichment_')) {
          enrichmentData[key] = this.metadata()[key];
        }
      })
      return enrichmentData;
    }
  }

  asJson = () => {
    return {
      id: this.id(),
      uniqueIdentifier: this.uniqueIdentifier(),
      name: this.name(),
      metadata: this.metadata(),
      createdAt: this.createdAt(),
      attributes: this.attributes(),
    }
  }

}

export default OrganizationProfile;