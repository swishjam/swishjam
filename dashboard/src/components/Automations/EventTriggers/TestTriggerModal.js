import Modal from "../../utils/Modal";
import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import SlackMessagePreview from "../../Slack/SlackMessagePreview";
import Markdown from 'react-markdown'
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import LoadingSpinner from "../../LoadingSpinner";
import { AlertOctagonIcon, CheckCircle2Icon } from "lucide-react";
import { swishjam } from "@swishjam/react";

export default function TestTriggerModal({
  isOpen,
  onClose,
  eventName,
  propertyOptions,
  slackMessageHeader,
  slackMessageBody,
  slackChannelName,
  slackChannelId,
  conditionalStatements,
}) {
  const exampleJSON = propertyOptions?.reduce((acc, property) => {
    if (property === 'user_attributes') {
      acc[property] = {
        email: 'jenny@swishjam.com',
      }
    } else if (property === 'organization_attributes') {
      acc[property] = {
        name: 'Swishjam',
      }
    } else {
      acc[property] = `Some ${property}`;
    }
    return acc;
  }, {})
  const [json, setJson] = useState(exampleJSON);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);

  const jsonKeys = Object.keys(json);
  const stringifiedJsonWithLineBreaks = jsonKeys.reduce((acc, key, index) => {
    const comma = index !== jsonKeys.length - 1 ? "," : "";
    if (typeof json[key] === 'object') {
      const nestedKeys = Object.keys(json[key]);
      const nestedString = nestedKeys.reduce((nestedAcc, nestedKey, nestedIndex) => {
        const nestedComma = nestedIndex !== nestedKeys.length - 1 ? "," : "";
        return nestedAcc + `      "${nestedKey}": ${JSON.stringify(json[key][nestedKey], null, 2)}${nestedComma}\n`;
      }, "{\n") + "    }";
      return acc + `    "${key}": ${nestedString}${comma}\n`;
    } else {
      return acc + `    "${key}": ${JSON.stringify(json[key], null, 2)}${comma}\n`;
    }
  }, "{\n") + "}\n";

  const interpolatedSlackBody = slackMessageBody.replace(/\{([^}]*)\}/g, (match, key) => {
    if (key === 'user_attributes') {
      return JSON.stringify(json[key], null, 2);
    } else if (key === 'organization_attributes') {
      return JSON.stringify(json[key], null, 2);
    }
    return json[key] || match;
  });

  const sendTest = async () => {
    setResultMessage(null);
    setIsSendingTest(true);
    const { did_trigger: didTrigger, error } = await SwishjamAPI.EventTriggers.triggerTest({
      eventPayload: json,
      eventName,
      conditionalStatements,
      steps: [{
        type: 'EventTriggerSteps::Slack',
        config: {
          message_header: slackMessageHeader,
          message_body: slackMessageBody,
          channel_id: slackChannelId,
          channel_name: slackChannelName,
        }
      }]
    })
    swishjam.event('event_trigger_tested', {
      event_name: eventName,
      slack_channel_name: slackChannelName,
      slack_message_header: slackMessageHeader,
      slack_message_body: slackMessageBody,
      did_trigger: didTrigger,
      error,
    })
    setIsSendingTest(false);
    if (error) {
      setResultMessage(<span className='text-red-700'>{error}</span>);
    } else if (didTrigger) {
      setResultMessage(
        <span className='text-green-700 flex items-center justify-center'>
          <CheckCircle2Icon className='h-4 w-4 inline mr-1 text-green-700' />
          Test message was sent to #{slackChannelName}.
        </span>
      );
    } else {
      setResultMessage(
        <span className='text-red-700 flex items-center justify-center'>
          <AlertOctagonIcon className='h-4 w-4 inline mr-1 text-red-700' />
          Your trigger conditions were not met, therefore the Slack Message was not sent.
        </span>
      );
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Test Your Trigger' size='large'>
      <div className='flex flex-col gap-y-2'>
        <div>
          <label htmlFor='test-trigger' className='block text-xs text-gray-700'>
            Example <span className='italic font-medium'>{eventName}</span> properties to test trigger with
          </label>
          <div className='mt-1'>
            <MonacoEditor
              height="200px"
              language="json"
              theme="vs-dark"
              value={stringifiedJsonWithLineBreaks}
              onChange={string => {
                setResultMessage(null)
                setJson(JSON.parse(string))
              }}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                matchBrackets: 'never'
              }}
            />
          </div>
          <SlackMessagePreview
            className='mt-2'
            header={slackMessageHeader}
            // we don't use InterpolatedMarkdown because we dont display variables, we just display the result
            body={<Markdown>{interpolatedSlackBody}</Markdown>}
          />
          <div className='mt-2'>
            {resultMessage && (
              <div className='text-sm text-gray-700 mb-2 text-center'>
                {resultMessage}
              </div>
            )}
            <div className='flex justify-end'>
              <button
                className={`${isSendingTest ? 'bg-gray-400 px-20' : 'bg-swishjam hover:bg-swishjam-dark'} inline-flex justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none`}
                onClick={sendTest}
                disabled={isSendingTest}
              >
                {isSendingTest
                  ? <LoadingSpinner color='white' center={true} />
                  : `Send Test to #${slackChannelName}`
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
