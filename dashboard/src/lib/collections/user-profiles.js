import UserProfile from "../models/user-profile";

export class UserProfiles {
  constructor(profilesAttributes) {
    this._models = profilesAttributes.map(attributes => new UserProfile(attributes));
  }

  models = () => this._models;
}

export default UserProfiles;