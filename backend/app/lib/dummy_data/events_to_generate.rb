module DummyData
  class EventsToGenerate
    class << self
      def prompt_user_for_or_generate_event_names
        prompter = TTY::Prompt.new
        should_use_custom_event_names = prompter.select("Would you like to specify the event names that are generated?", ['Yes', 'No, use auto-generated names']){ |q| q.default 'Yes' }
        if should_use_custom_event_names == 'Yes'
          names = prompter.ask("Enter the event names you would like to use in the generated data. Separate each name with a comma."){ |q| q.required true }
          return names.split(',').map{ |n| n.strip }
        else
          return [
            'PDF Downloaded', 'Chat Initiated', 'Chat Closed', 'Invited Teammate', 'Support Ticket Submitted', 'Search Submitted', 'Feedback Provided',
            'AI Hallucination Recieved', 'Updated Setting', 'API Error Received', 'Upgraded Subscription Plan', 'Added Seat', 'Payment Submitted'
          ]
        end
      end
    end
  end
end