import CustomNode from "./CustomNode";
import DottedUnderline from "@/components/utils/DottedUnderline";
import { MailIcon } from "lucide-react";
import { memo } from "react";
import ResendEmail from "../StepConfigurations/ResendEmail";
import FormattedSwishjamVariable from "@/components/utils/FormattedSwishjamVariable";

export default memo(({ id, data }) => {
  const { executionStepResults = {} } = data;
  const isExecutionResult = Object.keys(executionStepResults).length > 0;

  return (
    <CustomNode
      id={id}
      EditComponent={ResendEmail}
      data={data}
      icon={<MailIcon className="h-5 w-5" />}
      requiredData={['to', 'subject', 'from', 'body']}
      title="Send Email"
      dialogFullWidth={true}
    >
      {isExecutionResult
        ? (
          executionStepResults.error_message ? (
            <p className="text-sm text-red-500">
              Failed to send email: {executionStepResults.error_message}
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Successfully sent email to <DottedUnderline>{executionStepResults.execution_data?.resend_request_body?.to}</DottedUnderline>.
              </p>
              <p className='border-l-2 border-l-gray-300 pl-2 mt-2 text-gray-500'>
                {executionStepResults.execution_data?.resend_request_body?.text.slice(0, 100)}{executionStepResults.execution_data?.resend_request_body?.text.length > 100 ? '...' : ''}
              </p>
            </>
          )
        ) : (
          <p className="text-sm text-gray-700">
            Send <DottedUnderline>{data.subject}</DottedUnderline> to <FormattedSwishjamVariable includeBrackets={false}>{data.to}</FormattedSwishjamVariable>.
          </p>
        )}
    </CustomNode>
  )
})