package com.example.io;

import com.example.model.Point;

import java.io.*;
import java.util.*;

public class DataReader {

    public static List<Point> read(String filename) throws IOException {
        BufferedReader br = new BufferedReader(new FileReader(filename));

        int n = Integer.parseInt(br.readLine());
        List<Point> points = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            String[] parts = br.readLine().split(" ");
            points.add(new Point(
                    Double.parseDouble(parts[0]),
                    Double.parseDouble(parts[1])
            ));
        }

        br.close();
        return points;
    }
}