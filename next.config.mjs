/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
        localPatterns: [
            {
                pathname: '/logo.png',
            },
        ],
    },
}

export default nextConfig
