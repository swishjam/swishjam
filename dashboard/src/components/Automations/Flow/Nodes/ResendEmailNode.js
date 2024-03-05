import CustomNode from "./CustomNode";
import DottedUnderline from "@/components/utils/DottedUnderline";
import { MailIcon } from "lucide-react";
import { memo } from "react";
import ResendEmail from "../StepConfigurations/ResendEmail";

export default memo(({ id, data }) => {
  return (
    <CustomNode
      id={id}
      EditComponent={ResendEmail}
      data={data}
      icon={<MailIcon className="h-5 w-5" />}
      requiredData={['to', 'subject', 'from', 'body']}
      title="Send Email"
    >
      <p className="text-sm text-gray-700">
        Send <DottedUnderline>{data.subject}</DottedUnderline> email to <DottedUnderline>{data.to}</DottedUnderline>.
      </p>
    </CustomNode>
  )
})