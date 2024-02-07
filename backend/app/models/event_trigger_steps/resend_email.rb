module EventTriggerSteps
  class ResendEmail < EventTriggerStep
    def from_email
      config['from']
    end

    def subject
      config['subject']
    end

    def un_interpolated_body
      config['body']
    end

    def bcc
      config['bcc']
    end

    def cc
      config['cc']
    end

    def trigger!(prepared_event, as_test: false)
      to_email = prepared_event.user_properties['email']
      if to_email.nil?
        raise "No email address in event's `user_properties`: #{prepared_event.inspect}"
      end
      HTTParty.post(
        'https://api.resend.com/emails', 
        headers: { 
          'Authorization' => "Bearer #{resend_api_key}",
          'Content-Type' => 'application/json',
        },
        body: {
          from: from_email,
          to: to_email,
          subject: subject,
          text: EventVariableInterpolator.interpolated_text(un_interpolated_body, prepared_event),
        }.to_json
      )
    end
  end
end