// /var/www/html/nvrs-ts-v1/src/app/ui/components/ImageUpload.tsx

import { useState } from 'react'
import { Button } from '@/ui/button'

interface ImageUploadProps {
    menuItemId: number
    onUploadSuccess: (imageId: number) => void
    currentImageId?: number // Added property to track the current image ID
}

const ImageUpload = ({ menuItemId, onUploadSuccess, currentImageId }: ImageUploadProps) => {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setError(null)
        }
    }

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Step 1: If we have a current image ID, delete it first
            if (currentImageId) {
                console.log(`Attempting to delete image with ID ${currentImageId}`)

                try {
                    // Use the new endpoint that deletes by image_id
                    const deleteResponse = await fetch(`https://api.alexanderthenotsobad.us/api/images/${currentImageId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!deleteResponse.ok) {
                        console.warn(`Delete response failed with status: ${deleteResponse.status}`);
                        // We'll continue with upload even if delete fails, but log the error
                        if (deleteResponse.headers.get('content-type')?.includes('application/json')) {
                            const errorData = await deleteResponse.json();
                            console.warn('Error details:', errorData);
                        }
                    } else {
                        const deleteResult = await deleteResponse.json();
                        console.log('Delete result:', deleteResult);
                        console.log(`Successfully deleted image with ID ${currentImageId}`);
                    }
                } catch (deleteErr) {
                    console.error('Error during delete operation:', deleteErr);
                    // Continue with upload even if delete fails
                }
            }

            // Step 2: Now upload the new image
            console.log('Proceeding with image upload');
            const formData = new FormData()
            formData.append('image', file)

            const response = await fetch(`https://api.alexanderthenotsobad.us/api/images/upload/${menuItemId}`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to upload image')
            }

            const result = await response.json()
            console.log('Upload result:', result);
            setFile(null)
            onUploadSuccess(result.imageId)
        } catch (err) {
            console.error('Error in upload process:', err);
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-2">
                <label htmlFor="image-upload" className="text-sm font-medium">
                    Select Image
                </label>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="rounded-md border border-gray-300 px-3 py-2"
                    disabled={loading}
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end">
                <Button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className={loading ? "opacity-70" : ""}
                >
                    {loading ? "Uploading..." : "Upload Image"}
                </Button>
            </div>
        </div>
    )
}

export default ImageUpload