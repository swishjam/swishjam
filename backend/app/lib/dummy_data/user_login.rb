module DummyData
  class UserLogin
    class << self
      def prompt_user_for_login_credentials
        prompter = TTY::Prompt.new

        email = prompter.ask("Enter your email for your new or existing user login:"){ |q| q.required true }
        password = prompter.mask("Enter your password for your new or existing user login:"){ |q| q.required true }

        existing_user = User.find_by(email: email)
        if existing_user
          if existing_user.authenticate(password)
            puts "Going to use existing user with email #{email}.".colorize(:green)
            return existing_user
          else
            raise "A user already exists with an email of #{email}, but the provided password was incorrect. Either provide the correct password for #{email}, or you can create a new user by providing a new email."
          end
        else
          puts "Creating new user with email #{email}.".colorize(:green)
          return User.create!(email: email, password: password)
        end
        puts "\n"
      end
    end
  end
end