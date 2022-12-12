import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
// TODO: Implement the fileStogare logic
const logger = createLogger('attachment utils')

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    ) { }
    getAttachmentUrl(itemId: string) {
        logger.info('start get attachment url')
        return `https://${this.bucketName}.s3.amazonaws.com/${itemId}`
    }
    getUploadUrl(imageId: string) {
        logger.info('start get upload url')
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: imageId,
            Expires: Number(this.urlExpiration)
        })
    }
}