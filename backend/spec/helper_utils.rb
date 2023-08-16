def setup_test_data
  stub_apis
  @swishjam_organization = FactoryBot.create(:swishjam_organization)
end

def stub_apis
  allow(Geocoder).to receive(:search).and_return(
    [
      OpenStruct.new(
        ip: "172.56.21.89", 
        city: "Nashville", 
        region: "Tennessee", 
        country: "US", 
        loc: "36.1659,-86.7844", 
        latitude: 36.1659,
        longitude: -86.7844,
        org: "AS21928 T-Mobile USA, Inc.", 
        postal_code: "37201", 
        timezone: "America/Chicago", 
        readme: "https://ipinfo.io/missingauth"
      )
    ]
  )
end