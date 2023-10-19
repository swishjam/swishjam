namespace :seed do
  desc "Seeds the database with sample data"
  task dummy_data: [:environment] do
    DummyData::Seeder.run_seed!
  end
end
