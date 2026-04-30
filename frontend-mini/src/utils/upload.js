const DEFAULT_PARAMS = JSON.stringify({
  dedup: true,
  album_id: 0,
  watermark: false,
  compress: false,
})

const MAX_IMAGE_SIZE = 3 * 1024 * 1024

export const uploadImage = async file => {
  if (!file) {
    throw new Error('请选择图片')
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('图床仅支持 3MB 以内图片，请先压缩后再上传')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('params', DEFAULT_PARAMS)

  const response = await fetch('/api/uploads/image', {
    method: 'POST',
    body: formData,
  })

  const raw = await response.text()
  let data = null
  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch {
      data = { detail: raw }
    }
  }

  if (!response.ok) {
    throw new Error(data?.detail || '图片上传失败')
  }

  return data
}
