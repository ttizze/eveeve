import { Form, useNavigation } from '@remix-run/react'
import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { z } from 'zod'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"

const urlSchema = z.object({
  url: z.string().url("有効なURLを入力してください"),
})

export function URLInputForm() {
  const navigation = useNavigation()

  const [form, field] = useForm({
    id: "url-form",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: urlSchema })
    },
  })

  return (
    <Form method="post" {...getFormProps(form)} className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="url"
          name="url"
          placeholder="URLを入力"
          required
          className="flex-grow"
        />
        <Button
          type="submit"
          disabled={navigation.state === "submitting"}
        >
          {navigation.state === "submitting" ? "処理中..." : "翻訳を開始"}
        </Button>
      </div>
    </Form>
  )
}