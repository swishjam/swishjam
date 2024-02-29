import { MailIcon } from "lucide-react";
import CustomNode from "./CustomNode";
import DottedUnderline from "@/components/utils/DottedUnderline";

export default function ResendEmailNode({ id, data }) {
  return (
    <CustomNode
      id={id}
      icon={<MailIcon className="h-5 w-5" />}
      title="Send Email"
      width={data.width}
      onDelete={data.onDelete}
    >
      <p className="text-sm text-gray-700">
        Send <DottedUnderline>{data.subject}</DottedUnderline> email to <DottedUnderline>{data.to}</DottedUnderline>.
      </p>
    </CustomNode>
  )
}