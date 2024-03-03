const { expect } = require('chai');
const sinon = require('sinon');

const { uploadFileToS3 } = require('../services/uploadToS3');

afterEach(()=>{
    sinon.restore();
})

describe('uploadFileToS3', () => {

    it('should upload file successfully', async () => {
        const bucketName = 'testBucket';
        const file = { path: '/path/to/file.txt' };
        const region = "testRegion";
        const uploadSpy = sinon.stub().resolves({ Location: 'https://testBucket.s3.amazonaws.com/file123.txt' });
        const s3Client = { send: uploadSpy };

        const result = await uploadFileToS3(bucketName, file, s3Client, region);

        expect(uploadSpy.calledOnce).to.be.true;
        expect(result).to.equal('https://testBucket.s3.amazonaws.com/file123.txt');
    });

    it('should handle upload error', async () => {
        const bucketName = 'testBucket';
        const file = { path: '/path/to/file.txt' };
        const region = "testRegion";
        const uploadSpy = sinon.stub().rejects(new Error('Failed to upload'));
        const s3Client = { send: uploadSpy };

        try {
            await uploadFileToS3(bucketName, file, s3Client, region);
            throw new Error('Should have thrown error');
        } catch (err) {
            expect(err.message).to.equal('Failed to upload');
        }
    });

});
