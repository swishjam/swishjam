namespace :data_migrations do
  task migrate_event_triggers_to_automations: [:environment] do
    ActiveRecord::Base.logger.silence do
      event_triggers = EventTrigger.all
      puts "Beginning migration of #{event_triggers.count} Event Triggers to Automations...\n\n".colorize(:grey)
      event_triggers.each do |event_trigger|
        puts "Migrating Event Trigger #{event_trigger.id} to Automation...".colorize(:green)
        next_automation_step_conditions = []

        entry_point_automation_step = { 
          client_id: 'entry',
          type: AutomationSteps::EntryPoint.to_s, 
          config: { event_name: event_trigger.event_name }, 
          created_at: event_trigger.created_at, 
          updated_at: event_trigger.updated_at,
        }

        exit_automation_step = { 
          client_id: 'exit',
          type: AutomationSteps::Exit.to_s, 
          config: {}, 
          created_at: event_trigger.created_at, 
          updated_at: event_trigger.updated_at,
        }

        filter_step = nil
        if event_trigger.conditional_statements.count > 0
          rules = event_trigger.conditional_statements.map do |conditional_statement|
          type = conditional_statement['property'].starts_with?('user.') ? NextAutomationStepConditionRules::UserProperty.to_s : NextAutomationStepConditionRules::EventProperty.to_s
            { 
              type: type, 
              config: { 
                property: conditional_statement['property'],
                operator: conditional_statement['condition'],
                value: conditional_statement['property_value'],
              }
            }
          end
          filter_step = {
            client_id: 'filter',
            type: AutomationSteps::Filter.to_s,
            config: { 
              next_automation_step_condition_rules: event_trigger.conditional_statements.map do |conditional_statement|
                { 
                  property: conditional_statement['property'],
                  operator: conditional_statement['condition'],
                  value: conditional_statement['property_value'],
                }
              end
            },
            created_at: event_trigger.created_at,
            updated_at: event_trigger.updated_at,
          }
          next_automation_step_conditions[0] = {
            automation_step_client_id: 'entry',
            next_automation_step_client_id: 'filter',
            next_automation_step_condition_rules: rules,
          }
        end

        event_trigger_step = event_trigger.event_trigger_steps.first
        type = {
          EventTriggerSteps::ResendEmail.to_s => AutomationSteps::ResendEmail.to_s,
          EventTriggerSteps::Slack.to_s => AutomationSteps::SlackMessage.to_s,
        }[event_trigger_step.type]

        delay_step = nil
        if event_trigger_step.config['delay_delivery_by_minutes'].present?
          delay_step = {
            client_id: 'delay',
            type: AutomationSteps::Delay.to_s,
            config: {  delay_amount: event_trigger_step.config['delay_delivery_by_minutes'], delay_unit: 'minutes' },
            created_at: event_trigger.created_at,
            updated_at: event_trigger.updated_at,
          }
          next_automation_step_conditions << {
            automation_step_client_id: filter_step ? 'filter' : 'entry' ,
            next_automation_step_client_id: 'delay',
            next_automation_step_condition_rules: [{ type: NextAutomationStepConditionRules::AlwaysTrue.to_s, config: {} }],
          }
        end

        slack_or_resend_automation_step = {
          client_id: 'slack_or_resend',
          type: type,
          config: event_trigger_step.config.except('delay_delivery_by_minutes', 'un_resolved_variable_safety_net'),
          created_at: event_trigger.created_at,
          updated_at: event_trigger.updated_at,
        }

        next_automation_step_conditions << {
          automation_step_client_id: delay_step ? 'delay' : (filter_step ? 'filter' : 'entry'),
          next_automation_step_client_id: 'slack_or_resend',
          next_automation_step_condition_rules: [{ type: NextAutomationStepConditionRules::AlwaysTrue.to_s, config: {} }],
        }

        next_automation_step_conditions << {
          automation_step_client_id: 'slack_or_resend',
          next_automation_step_client_id: 'exit',
          next_automation_step_condition_rules: [{ type: NextAutomationStepConditionRules::AlwaysTrue.to_s, config: {} }],
        }

        automation = Automations::Creator.create_automation!(
          workspace: event_trigger.workspace,
          created_by_user: event_trigger.created_by_user,
          name: event_trigger.title || event_trigger.event_name,
          enabled: event_trigger.enabled,
          automation_steps: [entry_point_automation_step, filter_step, delay_step, slack_or_resend_automation_step, exit_automation_step].compact,
          next_automation_step_conditions: next_automation_step_conditions,
        )

        puts "Migrated Event Trigger #{event_trigger.id} to Automation #{automation.id}.".colorize(:green)
        puts "\n"
        puts "Event Trigger: #{event_trigger.to_json}".colorize(:yellow)
        puts "Event Trigger Steps: #{event_trigger.event_trigger_steps.to_json}".colorize(:yellow)
        puts "\n"
        puts "Automation: #{automation.to_json}".colorize(:yellow)
        puts "Automation Steps: #{automation.automation_steps.to_json}".colorize(:yellow)
        puts "Next Automation Step Conditions: #{automation.next_automation_step_conditions.to_json}".colorize(:yellow)
        puts "\n"

        triggered_event_triggers = event_trigger.triggered_event_triggers
        puts "Migrating #{triggered_event_triggers.count} triggered_event_triggers to executed_automations...".colorize(:grey)
        triggered_event_triggers.each do |triggered_event_trigger|
          executed_automation = automation.executed_automations.create!(
            event_json: triggered_event_trigger.event_json,
            event_uuid: triggered_event_trigger.event_uuid,
            seconds_from_occurred_at_to_executed: triggered_event_trigger.seconds_from_occurred_at_to_triggered,
            started_at: triggered_event_trigger.created_at,
            completed_at: triggered_event_trigger.updated_at,
            is_test_execution: false,
            retried_from_executed_automation_id: nil,
            executed_on_user_profile_id: triggered_event_trigger.event_json['user_profile_id'],
          )
          triggered_resend_or_slack_event_trigger = triggered_event_trigger.triggered_event_trigger_steps.first
          automation.automation_steps.each do |automation_step|
            if automation_step.is_a?(AutomationSteps::SlackMessage) || automation_step.is_a?(AutomationSteps::ResendEmail)
              executed_automation.executed_automation_steps.create!(
                automation_step: automation_step,
                started_at: triggered_resend_or_slack_event_trigger.started_at,
                completed_at: triggered_resend_or_slack_event_trigger.completed_at,
                execution_data: triggered_resend_or_slack_event_trigger.triggered_payload,
              )              
            else
              executed_automation.executed_automation_steps.create!(
                automation_step: automation_step,
                started_at: triggered_resend_or_slack_event_trigger.started_at,
                completed_at: triggered_resend_or_slack_event_trigger.completed_at,
              )
            end
          end
        end
        puts "Created #{triggered_event_triggers.count} executed automations!\n\n".colorize(:yellow)

      end
      puts "Completed migration of #{event_triggers.count} Event Triggers to Automations...\n\n".colorize(:green)
    end
  end
end