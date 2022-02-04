import { exec, ExecException } from 'child_process'

export default function executeCliCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, function (error: ExecException | null, stdout: string, stderr: string) {
      if (error) {
        reject(error)
      } else if (stderr) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}
