package com.example.algorithm;

import com.example.model.Point;
import com.example.util.Metrics;

import java.util.*;

public class GrahamScan {

    public static List<Point> run(List<Point> points) {
        Collections.sort(points, Comparator
                .comparingDouble((Point p) -> p.x)
                .thenComparingDouble(p -> p.y));

        List<Point> lower = new ArrayList<>();

        for (Point p : points) {
            Metrics.iterations++;

            while (lower.size() >= 2 &&
                    cross(lower.get(lower.size()-2),
                          lower.get(lower.size()-1), p) <= 0) {
                lower.remove(lower.size()-1);
            }
            lower.add(p);
        }

        List<Point> upper = new ArrayList<>();

        for (int i = points.size()-1; i >= 0; i--) {
            Point p = points.get(i);
            Metrics.iterations++;

            while (upper.size() >= 2 &&
                    cross(upper.get(upper.size()-2),
                          upper.get(upper.size()-1), p) <= 0) {
                upper.remove(upper.size()-1);
            }
            upper.add(p);
        }

        lower.remove(lower.size()-1);
        upper.remove(upper.size()-1);
        lower.addAll(upper);

        return lower;
    }

    private static double cross(Point O, Point A, Point B) {
        Metrics.iterations++;
        return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
    }
}