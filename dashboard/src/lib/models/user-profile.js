export class UserProfile {
  constructor(attributes) {
    this._id = attributes.id ? attributes.id : attributes.swishjam_user_id;
    this._email = attributes.email;
    this._uniqueIdentifier = attributes.user_unique_identifier;
    this._gravatarUrl = attributes.gravatar_url;
    this._metadata = attributes.metadata || {};
    this._createdAt = attributes.created_at;
    if (typeof this._metadata === 'string') {
      this._metadata = JSON.parse(this._metadata);
    }
  }

  id = () => this._id;
  email = () => this._email;
  uniqueIdentifier = () => this._uniqueIdentifier;
  gravatarUrl = () => this._gravatarUrl;
  metadata = () => this._metadata;
  createdAt = () => this._createdAt;

  fullName = () => {
    let name = this.metadata().full_name || this.metadata().fullName;
    if (!name && (this.metadata().first_name || this.metadata().firstName) && (this.metadata().last_name || this.metadata().lastName)) {
      name = `${this.metadata().first_name || this.metadata().firstName} ${this.metadata().last_name || this.metadata().lastName}`;
    }
    return name;
  }

  initials = () => {
    if (this.fullName()) {
      return this.fullName().split(' ').map((n) => n[0]).join('');
    } else if (this.email()) {
      const noDomain = this.email().split('@')[0];
      return noDomain.split('').slice(0, 2).join('');
    }
  }
}

export default UserProfile;