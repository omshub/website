/* --- READ OPERATIONS --- */

CREATE OR REPLACE FUNCTION "getAllReviews"(limit_count int DEFAULT NULL)
RETURNS TABLE(
    "reviewId" text,
    "courseId" text,
    "year" numeric,
    "semesterId" text,
    "isLegacy" boolean,
    "reviewerId" text,
    "isGTVerifiedReviewer" boolean,
    created numeric,
    modified numeric,
    workload numeric,
    difficulty numeric,
    overall numeric,
    upvotes numeric,
    downvotes numeric,
    body text
) AS $$
BEGIN
    IF limit_count IS NULL THEN
        RETURN QUERY
        SELECT 
            r."reviewId",
            r."courseId",
            r."year",
            r."semesterId",
            r."isLegacy",
            r."reviewerId",
            r."isGTVerifiedReviewer",
            r.created,
            r.modified,
            r.workload,
            r.difficulty,
            r.overall,
            r.upvotes,
            r.downvotes,
            r.body
        FROM review r
        ORDER BY created DESC;
    ELSE
        RETURN QUERY
        SELECT 
            r."reviewId",
            r."courseId",
            r."year",
            r."semesterId",
            r."isLegacy",
            r."reviewerId",
            r."isGTVerifiedReviewer",
            r.created,
            r.modified,
            r.workload,
            r.difficulty,
            r.overall,
            r.upvotes,
            r.downvotes,
            r.body
        FROM review r
        ORDER BY created DESC
        LIMIT limit_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "getReviewByReviewId"(review_id text)
RETURNS TABLE(
    "reviewId" text,
    "courseId" text,
    "year" numeric,
    "semesterId" text,
    "isLegacy" boolean,
    "reviewerId" text,
    "isGTVerifiedReviewer" boolean,
    created numeric,
    modified numeric,
    workload numeric,
    difficulty numeric,
    overall numeric,
    upvotes numeric,
    downvotes numeric,
    body text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r."reviewId",
        r."courseId",
        r."year",
        r."semesterId",
        r."isLegacy",
        r."reviewerId",
        r."isGTVerifiedReviewer",
        r.created,
        r.modified,
        r.workload,
        r.difficulty,
        r.overall,
        r.upvotes,
        r.downvotes,
        r.body
    FROM review r
    WHERE r."reviewId" = review_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "getReviewsByCourseId"(course_id text DEFAULT NULL)
RETURNS TABLE(
    "reviewId" text,
    "courseId" text,
    "year" numeric,
    "semesterId" text,
    "isLegacy" boolean,
    "reviewerId" text,
    "isGTVerifiedReviewer" boolean,
    created numeric,
    modified numeric,
    workload numeric,
    difficulty numeric,
    overall numeric,
    upvotes numeric,
    downvotes numeric,
    body text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r."reviewId",
        r."courseId",
        r."year",
        r."semesterId",
        r."isLegacy",
        r."reviewerId",
        r."isGTVerifiedReviewer",
        r.created,
        r.modified,
        r.workload,
        r.difficulty,
        r.overall,
        r.upvotes,
        r.downvotes,
        r.body
    FROM review r
    WHERE r."courseId" = COALESCE(course_id, r."courseId")
    ORDER BY
        r."year" DESC,
        -- order semesters chronologically descending within a given year
        CASE r."semesterId"
            WHEN 'sp' THEN 3
            WHEN 'sm' THEN 2
            WHEN 'fa' THEN 1
        END,
        created DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "getReviewsByUserId"(user_id text)
RETURNS TABLE(
    "reviewId" text,
    "courseId" text,
    "year" numeric,
    "semesterId" text,
    "isLegacy" boolean,
    "reviewerId" text,
    "isGTVerifiedReviewer" boolean,
    created numeric,
    modified numeric,
    workload numeric,
    difficulty numeric,
    overall numeric,
    upvotes numeric,
    downvotes numeric,
    body text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r."reviewId",
        r."courseId",
        r."year",
        r."semesterId",
        r."isLegacy",
        r."reviewerId",
        r."isGTVerifiedReviewer",
        r.created,
        r.modified,
        r.workload,
        r.difficulty,
        r.overall,
        r.upvotes,
        r.downvotes,
        r.body
    FROM review r
    WHERE r."reviewerId" = user_id
    ORDER BY
        "year" DESC,
        -- order semesters chronologically descending within a given year
        CASE r."semesterId"
            WHEN 'sp' THEN 3
            WHEN 'sm' THEN 2
            WHEN 'fa' THEN 1
        END,
        created DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "getStatsByCourseId"(course_id text DEFAULT NULL)
RETURNS TABLE (
    "courseId" text,
    "numReviews" bigint,
    "avgWorkload" numeric,
    "avgDifficulty" numeric,
    "avgOverall" numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
RETURN QUERY
SELECT 
    r."courseId",
    COUNT(*) AS "numReviews",
    AVG(r.workload) AS "avgWorkload",
    AVG(r.difficulty) AS "avgDifficulty",
    AVG(r.overall) AS "avgOverall"
FROM review r
WHERE r."courseId" = COALESCE(course_id, r."courseId")
GROUP BY r."courseId"
ORDER BY r."courseId";
END;
$$;

CREATE OR REPLACE FUNCTION "getStatsByCourseYearSemester"(course_id text DEFAULT NULL, year_ numeric DEFAULT NULL, semester_id text DEFAULT NULL)
RETURNS TABLE (
    "courseId" text,
    "year" numeric,
    "semesterId" text,
    "numReviews" bigint,
    "avgWorkload" numeric,
    "avgDifficulty" numeric,
    "avgOverall" numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
RETURN QUERY
SELECT 
    r."courseId",
    r."year",
    r."semesterId",
    COUNT(*) AS "numReviews",
    AVG(r.workload) AS "avgWorkload",
    AVG(r.difficulty) AS "avgDifficulty",
    AVG(r.overall) AS "avgOverall"
FROM review r
WHERE (
    r."courseId" = COALESCE(course_id, r."courseId")
    AND r."year" = COALESCE(year_, r."year")
    AND r."semesterId" = COALESCE(semester_id, r."semesterId")
)
GROUP BY r."courseId", r."year", r."semesterId"
ORDER BY 
    r."courseId",
    r."year",
    -- Order semesters chronologically ascending within a given year
    CASE r."semesterId"
        WHEN 'sp' THEN 1
        WHEN 'sm' THEN 2
        WHEN 'fa' THEN 3
    END;
END;
$$;
