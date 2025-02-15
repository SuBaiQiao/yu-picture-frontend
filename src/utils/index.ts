import { saveAs } from 'file-saver'
/**
 * 格式化文件大小
 * @param size
 */
const formatSize = (size) => {
  if (!size) return '未知'
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / 1024 / 1024).toFixed(2) + 'MB'
  } else {
    return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB'
  }
}

const downloadImage = (url: string, fileName: string) => {
  if (!url) {
    return
  }
  saveAs(url, fileName)
}

export { formatSize, downloadImage }
