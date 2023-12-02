export const generateUUID = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
}
export const getValue = function (data) {
    if ('number' == typeof (data))
        return data
    let r = /(\-?\d+\.?\d*)/i
    let arr = data ? data.match(r) : null
    return arr ? Number(arr[1]) : 0
}
