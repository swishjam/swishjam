class CreateAuthTables < ActiveRecord::Migration[6.1]
  def up
    create_table :users do |t|
      t.string :email
      t.string :first_name
      t.string :last_name
      t.string :password_digest
      t.string :jwt_secret_key
      t.timestamps
    end

    create_table :organizations do |t|
      t.string :name
      t.string :url
      t.timestamps
    end

    create_table :organization_users do |t|
      t.belongs_to :organization
      t.belongs_to :user
      t.timestamps
    end

    create_table :sessions do |t|
      t.belongs_to :user
      t.string :jwt_id
      t.timestamps
    end
  end

  def down
    drop_table :users
    drop_table :organizations
    drop_table :organization_users
    drop_table :sessions
  end
end
