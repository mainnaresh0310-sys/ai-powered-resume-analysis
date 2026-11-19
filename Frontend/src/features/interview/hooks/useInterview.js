
import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect, useState } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    // New states for file upload
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadStatus, setUploadStatus] = useState("")

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        setUploadProgress(0)
        setUploadStatus("uploading")

        let response = null

        try {
            response = await generateInterviewReport({
                jobDescription,
                selfDescription,
                resumeFile,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        )

                        setUploadProgress(percent)
                    }
                }
            })

            setReport(response.interviewReport)
            setUploadStatus("uploaded")

        } catch (error) {
            console.log(error)
            setUploadStatus("failed")

        } finally {
            setLoading(false)
        }

        return response?.interviewReport
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null

        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)

        } catch (error) {
            console.log(error)

        } finally {
            setLoading(false)
        }

        return response.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null

        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)

        } catch (error) {
            console.log(error)

        } finally {
            setLoading(false)
        }

        return response.interviewReports
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)

        try {
            const response = await generateResumePdf({ interviewReportId })

            const url = window.URL.createObjectURL(
                new Blob([response], { type: "application/pdf" })
            )

            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)

            document.body.appendChild(link)
            link.click()

        } catch (error) {
            console.log(error)

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [interviewId])

    return {
        loading,
        report,
        reports,
        uploadProgress,
        uploadStatus,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    }

}
