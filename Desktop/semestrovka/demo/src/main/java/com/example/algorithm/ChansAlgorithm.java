package com.example.algorithm;

import com.example.model.Point;
import com.example.util.Metrics;

import java.util.*;

public class ChansAlgorithm {

    public static List<Point> run(List<Point> points) {
        int n = points.size();
        if (n <= 3) return GrahamScan.run(points);

        for (int m = 1; m < n; m *= 2) {

            List<List<Point>> hulls = new ArrayList<>();

            for (int i = 0; i < n; i += m) {
                int end = Math.min(i + m, n);
                List<Point> subset = points.subList(i, end);
                hulls.add(GrahamScan.run(new ArrayList<>(subset)));
            }

            Point start = Collections.min(points, Comparator
                    .comparingDouble((Point p) -> p.x)
                    .thenComparingDouble(p -> p.y));

            List<Point> hull = new ArrayList<>();
            Point current = start;

            for (int i = 0; i < m; i++) {
                Metrics.iterations++;

                hull.add(current);
                Point next = nextPoint(current, hulls);

                if (next == start) return hull;
                current = next;
            }
        }
        return null;
    }

    private static Point nextPoint(Point current, List<List<Point>> hulls) {
        Point next = null;

        for (List<Point> hull : hulls) {
            for (Point p : hull) {
                Metrics.iterations++;

                if (p == current) continue;

                if (next == null || cross(current, next, p) < 0) {
                    next = p;
                }
            }
        }
        return next;
    }

    private static double cross(Point O, Point A, Point B) {
        Metrics.iterations++;
        return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
    }
}