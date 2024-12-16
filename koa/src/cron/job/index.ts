import moment from 'moment'
import schedule, { Job, RecurrenceRule } from 'node-schedule'

// 记录所有的任务及其执行时间
interface TaskSchedule {
  cronExpression: string
  callback: (params: any) => Promise<any> // 异步回调函数，接收动态参数
  job: Job | null
  scheduledTime?: moment.Moment // 使用 moment 类型来记录任务的执行时间
  params?: any // 动态传递的任务参数
  result?: any // 任务执行结果
}

// 用于保存任务的时间表
let taskSchedules: TaskSchedule[] = []

/**
 * @description: 创建一个基于 Cron 表达式的定时任务，支持传入参数
 * @param {string} cronExpression - Cron 表达式，定义任务执行的时间规则
 * @param {() => void} callback - 任务执行时的回调函数
 * @param {any} params - 动态任务参数
 * @returns {Job} 返回一个任务对象，用于后续取消或操作
 */
function createCronJob(cronExpression: string, callback: (params: any) => Promise<any>, params: any): Job {
  const job = schedule.scheduleJob(cronExpression, async () => {
    try {
      const result = await callback(params) // 执行回调函数并传递参数
      // 保存任务执行结果
      const taskSchedule = taskSchedules.find((task) => task.job === job)
      if (taskSchedule) taskSchedule.result = result
    } catch (error) {
      console.error('任务执行出错:', error)
    }
  })
  // 保存任务信息
  taskSchedules.push({ cronExpression, callback, job, scheduledTime: moment(), params })
  return job
}

/**
 * @description: 创建一个在指定时间执行的定时任务，支持传入参数
 * @param {Date} date - 指定的执行时间
 * @param {() => void} callback - 任务执行时的回调函数
 * @param {any} params - 动态任务参数
 * @returns {Job} 返回一个任务对象，用于后续取消或操作
 */
function createJobAtDate(date: Date, callback: (params: any) => Promise<any>, params: any): Job | null {
  // 将日期转换为 moment 对象
  const momentDate = moment(date)

  if (!momentDate.isValid()) {
    console.error('createJobAtDate-无效的日期对象', date)
    return null
  }

  // 获取当前时间，确保格式一致
  const now = moment()

  // 检查时间是否在当前时间之前
  if (momentDate.isBefore(now)) {
    // 任务已经错过，立即执行任务
    console.log(`createJobAtDate-任务时间已过，立即执行任务：${momentDate.format('YYYY-MM-DD HH:mm:ss')}`)
    callback(params)
    return null // 不再创建定时任务
  }

  // 创建定时任务
  const job = schedule.scheduleJob(momentDate.toDate(), async () => {
    try {
      const result = await callback(params) // 执行回调函数并传递参数
      // 保存任务执行结果
      const taskSchedule = taskSchedules.find((task) => task.job === job)
      if (taskSchedule) taskSchedule.result = result
    } catch (error) {
      console.error('任务执行出错:', error)
    }
  })

  if (job) {
    // 保存任务信息
    taskSchedules.push({
      cronExpression: momentDate.format('YYYY-MM-DD HH:mm:ss'),
      callback,
      scheduledTime: momentDate,
      job,
      params
    })

    console.log(`createJobAtDate-任务已创建，定时任务时间：${momentDate.format('YYYY-MM-DD HH:mm:ss')}`)
  } else {
    console.error('createJobAtDate-任务创建失败')
  }

  return job
}

/**
 * @description: 创建一个基于 RecurrenceRule（周期规则）的定时任务，支持传入参数
 * @param {RecurrenceRule} rule - 定义任务执行周期的规则
 * @param {() => void} callback - 任务执行时的回调函数
 * @param {any} params - 动态任务参数
 * @returns {Job} 返回一个任务对象，用于后续取消或操作
 */
function createPeriodicJob(rule: RecurrenceRule, callback: (params: any) => Promise<any>, params: any): Job {
  const job = schedule.scheduleJob(rule, async () => {
    try {
      const result = await callback(params) // 执行回调函数并传递参数
      // 保存任务执行结果
      const taskSchedule = taskSchedules.find((task) => task.job === job)
      if (taskSchedule) taskSchedule.result = result
    } catch (error) {
      console.error('任务执行出错:', error)
    }
  })
  // 保存任务信息
  taskSchedules.push({ cronExpression: rule.toString(), callback, job, scheduledTime: moment(), params })
  return job
}

/**
 * @description: 取消指定的定时任务
 * @param {Job | null} job - 需要取消的任务对象。如果传入 null，表示任务不存在
 * @returns {void} 没有返回值
 */
function cancelJob(job: Job | null): void {
  if (job) {
    job.cancel()
    console.log('任务已取消')
  } else {
    console.log('任务不存在')
  }
}

/**
 * @description: 创建一个异步执行的定时任务，支持传入参数
 * @param {string} cronExpression - Cron 表达式，定义任务执行的时间规则
 * @param {() => Promise<void>} asyncCallback - 异步任务的回调函数
 * @param {any} params - 动态任务参数
 * @returns {Promise<Job>} 返回一个任务对象，用于后续取消或操作
 */
async function createAsyncJob(cronExpression: string, asyncCallback: (params: any) => Promise<void>, params: any): Promise<Job> {
  const job = schedule.scheduleJob(cronExpression, async () => {
    try {
      await asyncCallback(params) // 执行回调函数并传递参数
    } catch (error) {
      console.error('异步任务执行出错:', error)
    }
  })
  // 保存任务信息
  taskSchedules.push({ cronExpression, callback: asyncCallback, job, scheduledTime: moment(), params })
  return job
}

export = { createCronJob, createJobAtDate, createPeriodicJob, cancelJob, createAsyncJob }
