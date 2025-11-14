"use client";

import React, { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { BASE_URL } from "@/lib/url";

interface Video {
  _id: string;
  title: string;
  url: string; // playbackId from Mux
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  videos: Video[];
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/payments/user-courses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // your JWT
          },
        });
        const data = await res.json();
        if (data.success) setCourses(data.courses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        You haven’t purchased any courses yet.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6">My Courses</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <Card key={course._id} className="shadow-md border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {course.title}
              </CardTitle>
              {/* <p className="text-sm text-muted-foreground">
                {course.description}
              </p> */}
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Course Preview Image */}
              {/* {course.images?.[0] && (
                <img
                  src={course.images[0]}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-md"
                />
              )} */}

              {/* Videos Section */}
              {course.videos.map((video) => (
                <div key={video._id}>
                  {/* <h3 className="text-sm font-medium mb-2">{video.title}</h3> */}
                  <MuxPlayer
                    streamType="on-demand"
                    playbackId={video.url} // playbackId from your backend
                    controls
                    autoPlay={false}
                    className="w-full aspect-video rounded-lg overflow-hidden"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
