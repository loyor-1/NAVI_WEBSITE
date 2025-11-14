import { ElMessage } from "element-plus";

// 文件上传类型校验
export function beforeUpload(file, arr = [], type) {
    const typeList = [...arr];
    const fileName = file.name;
    const extension = fileName.substr(fileName.lastIndexOf(".") + 1);
    const isRT = typeList.includes(extension);
    if (!isRT) {
        ElMessage.error(`文件格式不正确, 请上传${type}格式文件!`);
    }
    return isRT;
}