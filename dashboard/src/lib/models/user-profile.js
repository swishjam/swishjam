export class UserProfile {
  constructor(attributes) {
    this._attributes = attributes;
    this._id = attributes.id || attributes.swishjam_user_id;
    this._email = attributes.email;
    this._uniqueIdentifier = attributes.user_unique_identifier;
    this._metadata = attributes.metadata || {};
    this._createdAt = attributes.created_at;
    if (typeof this._metadata === 'string') {
      this._metadata = JSON.parse(this._metadata);
    }
  }

  id = () => this._id;
  email = () => this._email;
  uniqueIdentifier = () => this._uniqueIdentifier;
  metadata = () => this._metadata;
  properties = () => this._metadata;
  createdAt = () => this._createdAt;
  attributes = () => this._attributes;
  anonymousUserIdDisplay = () => this.id().slice(0, 6)

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

  metadataItem = key => this.metadata()[key];
  property = this.metadataItem;

  firstName = () => {
    return this.property('first_name') || this.property('firstName');
  }

  lastName = () => {
    return this.property('last_name') || this.property('lastName');
  }

  fullName = () => {
    let name = this.property('full_name') || this.property('fullName') || this.property('name');
    if (!name && (this.firstName() && this.lastName())) {
      name = `${this.firstName()} ${this.lastName()}`;
    }
    return name;
  }

  gravatarUrl = () => {
    return this.property('gravatar_url');
  }

  initials = () => {
    if (this.fullName()) {
      return this.fullName().split(' ').map((n) => n[0]).join('');
    } else if (this.email()) {
      const noDomain = this.email().split('@')[0];
      return noDomain.split('').slice(0, 2).join('');
    }
  }

  asJson = () => {
    return {
      id: this.id(),
      uniqueIdentifier: this.uniqueIdentifier(),
      email: this.email(),
      metadata: this.metadata(),
      firstName: this.firstName(),
      lastName: this.lastName(),
      fullName: this.fullName(),
      initials: this.initials(),
      gravatarUrl: this.gravatarUrl(),
      createdAt: this.createdAt(),
      attributes: this.attributes(),
    }
  }

}

export default UserProfile;